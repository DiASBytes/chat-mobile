import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
	View, Text, StyleSheet, ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { responsive } from 'react-native-responsive-ui';
import equal from 'deep-equal';

import I18n from '../../../i18n';
import sharedStyles from '../../Styles';
import { isIOS } from '../../../utils/deviceInfo';
import { headerIconSize } from '../../../containers/HeaderButton';
import Icon from './Icon';
import { COLOR_TEXT_DESCRIPTION, HEADER_TITLE, COLOR_WHITE } from '../../../constants/colors';

const TITLE_SIZE = 16;
const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: '100%'
	},
	titleContainer: {
		flex: 1,
		flexDirection: 'row'
	},
	title: {
		...sharedStyles.textSemibold,
		color: HEADER_TITLE,
		fontSize: TITLE_SIZE
	},
	scroll: {
		alignItems: 'center'
	},
	typing: {
		...sharedStyles.textRegular,
		color: isIOS ? COLOR_TEXT_DESCRIPTION : COLOR_WHITE,
		fontSize: 12,
		marginBottom: 2
	},
	typingUsers: {
		...sharedStyles.textSemibold
	}
});

@responsive
@connect((state, ownProps) => {
	let status = '';
	const { rid, type } = ownProps;
	if (type === 'd') {
		if (state.login.user && state.login.user.id) {
			const { id: loggedUserId } = state.login.user;
			const userId = rid.replace(loggedUserId, '').trim();
			if (userId === loggedUserId) {
				status = state.login.user.status; // eslint-disable-line
			} else {
				const user = state.activeUsers[userId];
				status = (user && user.status) || 'offline';
			}
		}
	}

	let otherUsersTyping = [];
	if (state.login.user && state.login.user.username) {
		const { username } = state.login.user;
		const { usersTyping } = state.room;
		otherUsersTyping = usersTyping.filter(_username => _username !== username);
	}

	return {
		usersTyping: otherUsersTyping,
		prid: null,
		status
	};
})
export default class RoomHeaderView extends Component {
	static propTypes = {
		title: PropTypes.string,
		type: PropTypes.string,
		prid: PropTypes.string,
		window: PropTypes.object,
		usersTyping: PropTypes.array,
		status: PropTypes.string
	};

	shouldComponentUpdate(nextProps) {
		const {
			type, title, status, usersTyping, window
		} = this.props;
		if (nextProps.type !== type) {
			return true;
		}
		if (nextProps.title !== title) {
			return true;
		}
		if (nextProps.status !== status) {
			return true;
		}
		if (nextProps.window.width !== window.width) {
			return true;
		}
		if (nextProps.window.height !== window.height) {
			return true;
		}
		if (!equal(nextProps.usersTyping, usersTyping)) {
			return true;
		}
		return false;
	}

	// componentDidUpdate(prevProps) {
	// 	if (isIOS) {
	// 		const { usersTyping } = this.props;
	// 		if (!equal(prevProps.usersTyping, usersTyping)) {
	// 			LayoutAnimation.easeInEaseOut();
	// 		}
	// 	}
	// }

	get typing() {
		const { usersTyping } = this.props;
		let usersText;
		if (!usersTyping.length) {
			return null;
		} else if (usersTyping.length === 2) {
			usersText = usersTyping.join(` ${ I18n.t('and') } `);
		} else {
			usersText = usersTyping.join(', ');
		}
		return (
			<Text style={styles.typing} numberOfLines={1}>
				<Text style={styles.typingUsers}>{usersText} </Text>
				{ usersTyping.length > 1 ? I18n.t('are_typing') : I18n.t('is_typing') }...
			</Text>
		);
	}

	render() {
		const {
			window, title, usersTyping, type, status, prid
		} = this.props;
		const portrait = window.height > window.width;
		const widthScrollView = window.width - 6.5 * headerIconSize;
		let scale = 1;

		if (!portrait) {
			if (usersTyping.length > 0) {
				scale = 0.8;
			}
		}

		return (
			<View style={styles.container}>
				<View style={[styles.titleContainer, { width: widthScrollView }]}>
					<ScrollView
						showsHorizontalScrollIndicator={false}
						horizontal
						bounces={false}
						contentContainerStyle={styles.scroll}
					>
						<Icon type={prid ? 'thread' : type} status={status} />
						<Text style={[styles.title, { fontSize: TITLE_SIZE * scale }]} numberOfLines={1}>{title}</Text>
					</ScrollView>
				</View>
				{this.typing}
			</View>
		);
	}
}
